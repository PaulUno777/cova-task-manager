package com.pauluno.task_manager.presentation.controller;

import com.pauluno.task_manager.application.service.AuthService;
import com.pauluno.task_manager.infrastructure.security.UserPrincipal;
import com.pauluno.task_manager.presentation.dto.AuthResponse;
import com.pauluno.task_manager.presentation.dto.LoginRequest;
import com.pauluno.task_manager.presentation.dto.RefreshRequest;
import com.pauluno.task_manager.presentation.dto.RegisterRequest;
import com.pauluno.task_manager.presentation.dto.UserProfileResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
	private final AuthService authService;

	public AuthController(AuthService authService) {
		this.authService = authService;
	}

	@PostMapping("/register")
	@ResponseStatus(HttpStatus.CREATED)
	AuthResponse register(@Valid @RequestBody RegisterRequest request) {
		return authService.register(request);
	}

	@PostMapping("/login")
	AuthResponse login(@Valid @RequestBody LoginRequest request) {
		return authService.login(request);
	}

	@PostMapping("/refresh")
	AuthResponse refresh(@Valid @RequestBody RefreshRequest request) {
		return authService.refresh(request.refresh_token());
	}

	@GetMapping("/me")
	UserProfileResponse profile(@AuthenticationPrincipal UserPrincipal principal) {
		return authService.profile(principal.id());
	}
}
