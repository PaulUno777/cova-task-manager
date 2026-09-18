package com.pauluno.task_manager.application.service;

import com.pauluno.task_manager.application.exception.ConflictException;
import com.pauluno.task_manager.application.exception.NotFoundException;
import com.pauluno.task_manager.infrastructure.persistence.UserRepository;
import com.pauluno.task_manager.infrastructure.persistence.entity.UserEntity;
import com.pauluno.task_manager.infrastructure.security.JwtService;
import com.pauluno.task_manager.presentation.dto.AuthResponse;
import com.pauluno.task_manager.presentation.dto.LoginRequest;
import com.pauluno.task_manager.presentation.dto.RegisterRequest;
import com.pauluno.task_manager.presentation.dto.UserProfileResponse;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AuthService {
	private final UserRepository users;
	private final PasswordEncoder passwordEncoder;
	private final JwtService jwtService;

	public AuthService(UserRepository users, PasswordEncoder passwordEncoder, JwtService jwtService) {
		this.users = users;
		this.passwordEncoder = passwordEncoder;
		this.jwtService = jwtService;
	}

	public AuthResponse register(RegisterRequest request) {
		String email = request.email().trim().toLowerCase();
		if (users.existsByEmail(email)) throw new ConflictException("Email is already registered");
		UserEntity user = users.save(new UserEntity(email, passwordEncoder.encode(request.password())));
		return authenticate(user);
	}

	@Transactional(readOnly = true)
	public AuthResponse login(LoginRequest request) {
		UserEntity user = users.findByEmail(request.email().trim().toLowerCase())
			.orElseThrow(() -> new BadCredentialsException("Invalid email or password"));
		if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
			throw new BadCredentialsException("Invalid email or password");
		}
		return authenticate(user);
	}

	@Transactional(readOnly = true)
	public UserProfileResponse profile(Long userId) {
		return toProfile(users.findById(userId).orElseThrow(() -> new NotFoundException("User not found")));
	}

	@Transactional(readOnly = true)
	public AuthResponse refresh(String refreshToken) {
		Long userId = jwtService.validateRefreshToken(refreshToken);
		UserEntity user = users.findById(userId)
			.orElseThrow(() -> new BadCredentialsException("Invalid or expired refresh token"));
		return authenticate(user);
	}

	private AuthResponse authenticate(UserEntity user) {
		return new AuthResponse(jwtService.generateToken(user.getId(), user.getEmail()),
			jwtService.generateRefreshToken(user.getId(), user.getEmail()), "Bearer",
			jwtService.accessTokenExpirySeconds(), toProfile(user));
	}

	private UserProfileResponse toProfile(UserEntity user) {
		return new UserProfileResponse(user.getId(), user.getEmail(), user.getCreatedAt());
	}
}
