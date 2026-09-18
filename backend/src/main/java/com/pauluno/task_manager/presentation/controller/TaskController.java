package com.pauluno.task_manager.presentation.controller;

import com.pauluno.task_manager.application.service.TaskService;
import com.pauluno.task_manager.domain.model.TaskStatus;
import com.pauluno.task_manager.infrastructure.security.UserPrincipal;
import com.pauluno.task_manager.presentation.dto.CreateTaskRequest;
import com.pauluno.task_manager.presentation.dto.PageResponse;
import com.pauluno.task_manager.presentation.dto.TaskResponse;
import com.pauluno.task_manager.presentation.dto.UpdateTaskRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/tasks")
public class TaskController {
	private final TaskService taskService;

	public TaskController(TaskService taskService) { this.taskService = taskService; }

	@GetMapping
	PageResponse<TaskResponse> list(@AuthenticationPrincipal UserPrincipal principal,
		@RequestParam(required = false) TaskStatus status, @RequestParam(required = false) String search,
		@RequestParam(defaultValue = "0") @Min(0) int page, @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {
		return taskService.list(principal.id(), status, search, page, size);
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	TaskResponse create(@AuthenticationPrincipal UserPrincipal principal, @Valid @RequestBody CreateTaskRequest request) {
		return taskService.create(principal.id(), request);
	}

	@PutMapping("/{taskId}")
	TaskResponse update(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long taskId,
		@Valid @RequestBody UpdateTaskRequest request) {
		return taskService.update(principal.id(), taskId, request);
	}

	@DeleteMapping("/{taskId}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	void delete(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long taskId) {
		taskService.delete(principal.id(), taskId);
	}
}
