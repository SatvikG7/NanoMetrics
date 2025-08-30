package io.github.satvikg7.nanometrics.authservice.controller;

import io.github.satvikg7.nanometrics.authservice.dto.LoginRequest;
import io.github.satvikg7.nanometrics.authservice.dto.RegisterRequest;
import io.github.satvikg7.nanometrics.authservice.dto.UserResponse;
import io.github.satvikg7.nanometrics.authservice.response.ApiResponse;
import io.github.satvikg7.nanometrics.authservice.service.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

  private final AuthService authService;

  @PostMapping("/login")
  public ResponseEntity<ApiResponse<String>> login(@Valid @RequestBody LoginRequest request,
      HttpServletResponse response) {
    String token = authService.login(request);

    Cookie cookie = new Cookie("authToken", token);
    cookie.setHttpOnly(true);
    cookie.setSecure(false);
    cookie.setPath("/");
    cookie.setMaxAge(24 * 60 * 60);
    response.addCookie(cookie);

    return ResponseEntity.ok(ApiResponse.success("Login successful"));
  }

  @PostMapping("/register")
  public ResponseEntity<ApiResponse<UserResponse>> register(@Valid @RequestBody RegisterRequest request) {
    UserResponse userResponse = authService.register(request);
    return ResponseEntity.ok(ApiResponse.success(userResponse, "User registered successfully"));
  }

  @GetMapping("/me")
  public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(Authentication authentication) {
    UUID userId = (UUID) authentication.getPrincipal();
    UserResponse userResponse = authService.getCurrentUser(userId);
    return ResponseEntity.ok(ApiResponse.success(userResponse));
  }

  @PostMapping("/logout")
  public ResponseEntity<ApiResponse<String>> logout(HttpServletResponse response) {
    Cookie cookie = new Cookie("authToken", null);
    cookie.setHttpOnly(true);
    cookie.setSecure(false);
    cookie.setPath("/");
    cookie.setMaxAge(0);
    response.addCookie(cookie);

    return ResponseEntity.ok(ApiResponse.success("Logout successful"));
  }
}
