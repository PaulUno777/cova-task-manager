package com.pauluno.task_manager.presentation.dto;

public record AuthResponse(String access_token, String refresh_token, String token_type, long expires_in,
		UserProfileResponse user) {
}
