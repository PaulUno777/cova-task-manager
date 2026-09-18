package com.pauluno.task_manager.infrastructure.persistence.entity;

import com.pauluno.task_manager.domain.model.TaskStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "tasks")
public class TaskEntity {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "user_id", nullable = false)
	private UserEntity user;

	@Column(nullable = false, length = 200)
	private String title;

	@Column(length = 2000)
	private String description;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	private TaskStatus status;

	@Column(nullable = false, updatable = false)
	private Instant createdAt;

	@Column(nullable = false)
	private Instant updatedAt;

	protected TaskEntity() {
	}

	public TaskEntity(UserEntity user, String title, String description, TaskStatus status) {
		this.user = user;
		this.title = title;
		this.description = description;
		this.status = status;
	}

	@PrePersist
	void onCreate() { createdAt = updatedAt = Instant.now(); }

	@PreUpdate
	void onUpdate() { updatedAt = Instant.now(); }

	public void update(String title, String description, TaskStatus status) {
		this.title = title;
		this.description = description;
		this.status = status;
	}

	public Long getId() { return id; }
	public String getTitle() { return title; }
	public String getDescription() { return description; }
	public TaskStatus getStatus() { return status; }
	public Instant getCreatedAt() { return createdAt; }
	public Instant getUpdatedAt() { return updatedAt; }
}
