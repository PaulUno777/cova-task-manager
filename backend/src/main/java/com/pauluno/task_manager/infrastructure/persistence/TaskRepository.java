package com.pauluno.task_manager.infrastructure.persistence;

import com.pauluno.task_manager.domain.model.TaskStatus;
import com.pauluno.task_manager.infrastructure.persistence.entity.TaskEntity;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TaskRepository extends JpaRepository<TaskEntity, Long> {
	Optional<TaskEntity> findByIdAndUser_Id(Long id, Long userId);

	@Query("""
		select t from TaskEntity t where t.user.id = :userId
		and (:status is null or t.status = :status)
		and (:search is null or lower(t.title) like lower(concat('%', :search, '%'))
			or lower(coalesce(t.description, '')) like lower(concat('%', :search, '%')))
		""")
	Page<TaskEntity> search(@Param("userId") Long userId, @Param("status") TaskStatus status,
		@Param("search") String search, Pageable pageable);
}
