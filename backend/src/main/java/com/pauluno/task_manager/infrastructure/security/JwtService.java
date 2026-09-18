package com.pauluno.task_manager.infrastructure.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;

@Service
public class JwtService {
	private static final String TYPE_CLAIM = "type";
	private static final String REFRESH_TYPE = "refresh";

	private final SecretKey key;
	private final long accessExpirationMs;
	private final long refreshExpirationMs;

	public JwtService(@Value("${app.jwt.secret}") String secret,
			@Value("${app.jwt.access-expiration-ms}") long accessExpirationMs,
			@Value("${app.jwt.refresh-expiration-ms}") long refreshExpirationMs) {
		this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
		this.accessExpirationMs = accessExpirationMs;
		this.refreshExpirationMs = refreshExpirationMs;
	}

	public String generateToken(Long userId, String email) {
		Instant now = Instant.now();
		return Jwts.builder().subject(email).claim("uid", userId).issuedAt(Date.from(now))
				.expiration(Date.from(now.plusMillis(accessExpirationMs))).signWith(key).compact();
	}

	public String generateRefreshToken(Long userId, String email) {
		Instant now = Instant.now();
		return Jwts.builder().subject(email).claim("uid", userId).claim(TYPE_CLAIM, REFRESH_TYPE)
				.issuedAt(Date.from(now)).expiration(Date.from(now.plusMillis(refreshExpirationMs)))
				.signWith(key).compact();
	}

	/** Returns the user id encoded in a valid, non-expired refresh token; rejects access tokens. */
	public Long validateRefreshToken(String token) {
		try {
			Claims claims = parse(token);
			if (!REFRESH_TYPE.equals(claims.get(TYPE_CLAIM, String.class))) {
				throw new BadCredentialsException("Invalid or expired refresh token");
			}
			return claims.get("uid", Long.class);
		} catch (JwtException | IllegalArgumentException e) {
			throw new BadCredentialsException("Invalid or expired refresh token");
		}
	}

	public long accessTokenExpirySeconds() { return accessExpirationMs / 1000; }

	public Claims parse(String token) {
		return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
	}

	static boolean isRefreshToken(Claims claims) { return REFRESH_TYPE.equals(claims.get(TYPE_CLAIM, String.class)); }
}
