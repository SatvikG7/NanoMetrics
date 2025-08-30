package io.github.satvikg7.nanometrics.authservice.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.UUID;

@Component
public class JwtUtil {

  @Value("${jwt.secret:mySecretKey123456789012345678901234567890}")
  private String secret;

  @Value("${jwt.expiration:86400000}")
  private Long expiration;

  private SecretKey getSigningKey() {
    return Keys.hmacShaKeyFor(secret.getBytes());
  }

  public String generateToken(UUID userId, String username) {
    return Jwts.builder()
        .subject(userId.toString())
        .claim("username", username)
        .issuedAt(new Date())
        .expiration(new Date(System.currentTimeMillis() + expiration))
        .signWith(getSigningKey())
        .compact();
  }

  public Claims getClaimsFromToken(String token) {
    return Jwts.parser()
        .verifyWith(getSigningKey())
        .build()
        .parseSignedClaims(token)
        .getPayload();
  }

  public UUID getUserIdFromToken(String token) {
    Claims claims = getClaimsFromToken(token);
    return UUID.fromString(claims.getSubject());
  }

  public String getUsernameFromToken(String token) {
    Claims claims = getClaimsFromToken(token);
    return claims.get("username", String.class);
  }

  public boolean isTokenValid(String token) {
    try {
      getClaimsFromToken(token);
      return true;
    } catch (Exception e) {
      return false;
    }
  }

  public boolean isTokenExpired(String token) {
    try {
      Claims claims = getClaimsFromToken(token);
      return claims.getExpiration().before(new Date());
    } catch (Exception e) {
      return true;
    }
  }
}
