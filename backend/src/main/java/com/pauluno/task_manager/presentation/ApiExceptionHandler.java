package com.pauluno.task_manager.presentation;

import com.pauluno.task_manager.application.exception.ConflictException;
import com.pauluno.task_manager.application.exception.NotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import java.time.Instant;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

@RestControllerAdvice
public class ApiExceptionHandler {
	@ExceptionHandler(MethodArgumentNotValidException.class)
	ResponseEntity<ApiError> validation(MethodArgumentNotValidException exception, HttpServletRequest request) {
		Map<String, String> fields = exception.getBindingResult().getFieldErrors().stream()
				.collect(java.util.stream.Collectors.toMap(fieldError -> fieldError.getField(),
						fieldError -> fieldError.getDefaultMessage(), (a, b) -> a));
		return response(HttpStatus.BAD_REQUEST, "Validation failed", request, fields);
	}

	@ExceptionHandler({ HandlerMethodValidationException.class, MethodArgumentTypeMismatchException.class })
	ResponseEntity<ApiError> invalidRequest(Exception exception, HttpServletRequest request) {
		return response(HttpStatus.BAD_REQUEST, "Invalid request", request, null);
	}

	@ExceptionHandler(BadCredentialsException.class)
	ResponseEntity<ApiError> badCredentials(BadCredentialsException exception, HttpServletRequest request) {
		return response(HttpStatus.UNAUTHORIZED, "Invalid email or password", request, null);
	}

	@ExceptionHandler(NotFoundException.class)
	ResponseEntity<ApiError> notFound(NotFoundException exception, HttpServletRequest request) {
		return response(HttpStatus.NOT_FOUND, exception.getMessage(), request, null);
	}

	@ExceptionHandler(ConflictException.class)
	ResponseEntity<ApiError> conflict(ConflictException exception, HttpServletRequest request) {
		return response(HttpStatus.CONFLICT, exception.getMessage(), request, null);
	}

	private ResponseEntity<ApiError> response(HttpStatus status, String message, HttpServletRequest request,
			Map<String, String> fields) {
		return ResponseEntity.status(status)
				.body(new ApiError(status.value(), message, Instant.now(), request.getRequestURI(), fields));
	}

	public record ApiError(int status, String message, Instant timestamp, String path, Map<String, String> fields) {
	}
}
