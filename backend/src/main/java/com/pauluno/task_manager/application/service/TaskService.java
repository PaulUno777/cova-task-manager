package com.pauluno.task_manager.application.service;

import com.pauluno.task_manager.application.exception.NotFoundException;
import com.pauluno.task_manager.domain.model.TaskStatus;
import com.pauluno.task_manager.infrastructure.persistence.TaskRepository;
import com.pauluno.task_manager.infrastructure.persistence.UserRepository;
import com.pauluno.task_manager.infrastructure.persistence.entity.TaskEntity;
import com.pauluno.task_manager.infrastructure.persistence.entity.UserEntity;
import com.pauluno.task_manager.presentation.dto.CreateTaskRequest;
import com.pauluno.task_manager.presentation.dto.PageResponse;
import com.pauluno.task_manager.presentation.dto.TaskResponse;
import com.pauluno.task_manager.presentation.dto.UpdateTaskRequest;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class TaskService {
	private final TaskRepository tasks;
	private final UserRepository users;

	public TaskService(TaskRepository tasks, UserRepository users) {
		this.tasks = tasks;
		this.users = users;
	}

	public TaskResponse create(Long userId, CreateTaskRequest request) {
		UserEntity user = users.getReferenceById(userId);
		return toResponse(tasks.save(new TaskEntity(user, request.title().trim(), request.description(),
			request.status() == null ? TaskStatus.TODO : request.status())));
	}

	@Transactional(readOnly = true)
	public PageResponse<TaskResponse> list(Long userId, TaskStatus status, String search, int page, int size) {
		String query = search == null || search.isBlank() ? null : search.trim();
		var result = tasks.search(userId, status, query, PageRequest.of(page, size, Sort.by("createdAt").descending())).map(this::toResponse);
		return PageResponse.from(result);
	}

	public TaskResponse update(Long userId, Long taskId, UpdateTaskRequest request) {
		TaskEntity task = ownedTask(userId, taskId);
		task.update(request.title().trim(), request.description(), request.status());
		return toResponse(task);
	}

	public void delete(Long userId, Long taskId) {
		tasks.delete(ownedTask(userId, taskId));
	}

	private TaskEntity ownedTask(Long userId, Long taskId) {
		return tasks.findByIdAndUser_Id(taskId, userId).orElseThrow(() -> new NotFoundException("Task not found"));
	}

	private TaskResponse toResponse(TaskEntity task) {
		return new TaskResponse(task.getId(), task.getTitle(), task.getDescription(), task.getStatus(), task.getCreatedAt(), task.getUpdatedAt());
	}
}
