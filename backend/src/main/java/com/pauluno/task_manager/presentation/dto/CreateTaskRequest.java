package com.pauluno.task_manager.presentation.dto;

import com.pauluno.task_manager.domain.model.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateTaskRequest(
	@NotBlank @Size(max = 200) String title,
	@Size(max = 2000) String description,
	TaskStatus status) {
}
