package com.pauluno.task_manager;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import com.pauluno.task_manager.infrastructure.persistence.TaskRepository;
import com.pauluno.task_manager.infrastructure.persistence.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class TaskApiIntegrationTests {
	@Autowired private MockMvc mvc;
	@Autowired private ObjectMapper objectMapper;
	@Autowired private UserRepository users;
	@Autowired private TaskRepository tasks;

	@BeforeEach
	void clearDatabase() {
		tasks.deleteAll();
		users.deleteAll();
	}

	@Test
	void registersLogsInAndReturnsCurrentProfile() throws Exception {
		String token = register("person@example.com");

		mvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + token))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.email").value("person@example.com"))
			.andExpect(jsonPath("$.createdAt").exists());

		mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
			.content("{\"email\":\"person@example.com\",\"password\":\"password123\"}"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.access_token").isNotEmpty())
			.andExpect(jsonPath("$.refresh_token").isNotEmpty())
			.andExpect(jsonPath("$.token_type").value("Bearer"));
	}

	@Test
	void refreshesAccessTokenAndRejectsTokenTypeConfusion() throws Exception {
		String registerBody = mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
			.content("{\"email\":\"refresh@example.com\",\"password\":\"password123\"}"))
			.andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
		JsonNode registerJson = objectMapper.readTree(registerBody);
		String accessToken = registerJson.get("access_token").asString();
		String refreshToken = registerJson.get("refresh_token").asString();

		String refreshBody = mvc.perform(post("/api/auth/refresh").contentType(MediaType.APPLICATION_JSON)
			.content("{\"refresh_token\":\"" + refreshToken + "\"}"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.access_token").isNotEmpty())
			.andReturn().getResponse().getContentAsString();
		String newAccessToken = objectMapper.readTree(refreshBody).get("access_token").asString();

		mvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + newAccessToken))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.email").value("refresh@example.com"));

		// An access token must not work as a refresh token.
		mvc.perform(post("/api/auth/refresh").contentType(MediaType.APPLICATION_JSON)
			.content("{\"refresh_token\":\"" + accessToken + "\"}"))
			.andExpect(status().isUnauthorized());

		// A refresh token must not work as a bearer access token.
		mvc.perform(get("/api/tasks").header("Authorization", "Bearer " + refreshToken))
			.andExpect(status().isUnauthorized());
	}

	@Test
	void protectsTasksAndEnforcesOwnership() throws Exception {
		mvc.perform(get("/api/tasks")).andExpect(status().isUnauthorized());
		String ownerToken = register("owner@example.com");
		String otherToken = register("other@example.com");
		long taskId = createTask(ownerToken, "Private task", "Only the owner can change this", "TODO");

		mvc.perform(put("/api/tasks/{taskId}", taskId).header("Authorization", "Bearer " + otherToken)
			.contentType(MediaType.APPLICATION_JSON).content("{\"title\":\"Stolen\",\"status\":\"DONE\"}"))
			.andExpect(status().isNotFound());
		mvc.perform(delete("/api/tasks/{taskId}", taskId).header("Authorization", "Bearer " + otherToken))
			.andExpect(status().isNotFound());
	}

	@Test
	void filtersSearchesAndPaginatesOnlyTheCurrentUsersTasks() throws Exception {
		String token = register("tasks@example.com");
		createTask(token, "Write report", "Draft the assessment report", "TODO");
		createTask(token, "Review pull request", "Check the implementation", "DONE");

		mvc.perform(get("/api/tasks").header("Authorization", "Bearer " + token)
			.param("status", "TODO").param("search", "report").param("page", "0").param("size", "1"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.totalElements").value(1))
			.andExpect(jsonPath("$.content[0].title").value("Write report"));
	}

	private String register(String email) throws Exception {
		String body = mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
			.content("{\"email\":\"" + email + "\",\"password\":\"password123\"}"))
			.andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
		return objectMapper.readTree(body).get("access_token").asString();
	}

	private long createTask(String token, String title, String description, String status) throws Exception {
		String body = mvc.perform(post("/api/tasks").header("Authorization", "Bearer " + token)
			.contentType(MediaType.APPLICATION_JSON).content("{\"title\":\"" + title + "\",\"description\":\"" + description + "\",\"status\":\"" + status + "\"}"))
			.andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
		JsonNode response = objectMapper.readTree(body);
		return response.get("id").asLong();
	}
}
