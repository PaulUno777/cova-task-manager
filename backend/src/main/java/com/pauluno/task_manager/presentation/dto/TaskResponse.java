package com.pauluno.task_manager.presentation.dto;

import com.pauluno.task_manager.domain.model.TaskStatus;
import java.time.Instant;

public record TaskResponse(Long id, String title, String description, TaskStatus status, Instant createdAt, Instant updatedAt) {
}
