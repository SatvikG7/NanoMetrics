package io.github.satvikg7.nanometrics.authservice.service;

import io.github.satvikg7.nanometrics.authservice.dto.LoginRequest;
import io.github.satvikg7.nanometrics.authservice.dto.RegisterRequest;
import io.github.satvikg7.nanometrics.authservice.dto.UserResponse;
import io.github.satvikg7.nanometrics.authservice.entity.User;
import io.github.satvikg7.nanometrics.authservice.enums.ErrorCode;
import io.github.satvikg7.nanometrics.authservice.exception.AuthException;
import io.github.satvikg7.nanometrics.authservice.repository.UserRepository;
import io.github.satvikg7.nanometrics.authservice.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

  @Mock
  private UserRepository userRepository;

  @Mock
  private PasswordEncoder passwordEncoder;

  @Mock
  private JwtUtil jwtUtil;

  @InjectMocks
  private AuthService authService;

  private User user;

  @BeforeEach
  void setUp() {
    user = new User();
    user.setId(UUID.randomUUID());
    user.setUsername("testuser");
    user.setFname("Test");
    user.setLname("User");
    user.setEmail("test@example.com");
    user.setPasshash("hashedpassword");
    user.setCreatedAt(LocalDateTime.now());
    user.setUpdatedAt(LocalDateTime.now());
  }

  @Test
  void loginSuccess() {
    LoginRequest request = new LoginRequest();
    request.setUsername("testuser");
    request.setPassword("password");

    when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
    when(passwordEncoder.matches("password", "hashedpassword")).thenReturn(true);
    when(jwtUtil.generateToken(user.getId(), user.getUsername())).thenReturn("token123");

    String token = authService.login(request);
    assertEquals("token123", token);
  }

  @Test
  void loginInvalidUsername() {
    LoginRequest request = new LoginRequest();
    request.setUsername("baduser");
    request.setPassword("password");

    when(userRepository.findByUsername("baduser")).thenReturn(Optional.empty());

    AuthException ex = assertThrows(AuthException.class, () -> authService.login(request));
    assertEquals(ErrorCode.INVALID_CREDENTIALS, ex.getErrorCode());
  }

  @Test
  void loginInvalidPassword() {
    LoginRequest request = new LoginRequest();
    request.setUsername("testuser");
    request.setPassword("wrongpass");

    when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
    when(passwordEncoder.matches("wrongpass", "hashedpassword")).thenReturn(false);

    AuthException ex = assertThrows(AuthException.class, () -> authService.login(request));
    assertEquals(ErrorCode.INVALID_CREDENTIALS, ex.getErrorCode());
  }

  @Test
  void registerSuccess() {
    RegisterRequest request = new RegisterRequest();
    request.setUsername("newuser");
    request.setPassword("pass123");
    request.setFname("New");
    request.setLname("User");
    request.setEmail("new@example.com");

    when(userRepository.existsByUsername("newuser")).thenReturn(false);
    when(userRepository.existsByEmail("new@example.com")).thenReturn(false);
    when(passwordEncoder.encode("pass123")).thenReturn("encodedpass");

    User saved = new User();
    saved.setId(UUID.randomUUID());
    saved.setUsername("newuser");
    saved.setFname("New");
    saved.setLname("User");
    saved.setEmail("new@example.com");
    saved.setPasshash("encodedpass");
    saved.setCreatedAt(LocalDateTime.now());
    saved.setUpdatedAt(LocalDateTime.now());

    when(userRepository.save(any(User.class))).thenReturn(saved);

    UserResponse response = authService.register(request);
    assertEquals(saved.getId(), response.getId());
    assertEquals("newuser", response.getUsername());
    assertEquals("new@example.com", response.getEmail());
  }

  @Test
  void registerUsernameExists() {
    RegisterRequest request = new RegisterRequest();
    request.setUsername("dupuser");
    request.setEmail("dup@example.com");
    request.setPassword("pass");
    request.setFname("Dup");
    request.setLname("User");

    when(userRepository.existsByUsername("dupuser")).thenReturn(true);

    AuthException ex = assertThrows(AuthException.class, () -> authService.register(request));
    assertEquals(ErrorCode.USERNAME_ALREADY_EXISTS, ex.getErrorCode());
  }

  @Test
  void registerEmailExists() {
    RegisterRequest request = new RegisterRequest();
    request.setUsername("uniqueuser");
    request.setEmail("dup@example.com");
    request.setPassword("pass");
    request.setFname("Unique");
    request.setLname("User");

    when(userRepository.existsByUsername("uniqueuser")).thenReturn(false);
    when(userRepository.existsByEmail("dup@example.com")).thenReturn(true);

    AuthException ex = assertThrows(AuthException.class, () -> authService.register(request));
    assertEquals(ErrorCode.EMAIL_ALREADY_EXISTS, ex.getErrorCode());
  }

  @Test
  void getCurrentUserSuccess() {
    when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));

    UserResponse response = authService.getCurrentUser(user.getId());
    assertEquals(user.getId(), response.getId());
    assertEquals(user.getUsername(), response.getUsername());
  }

  @Test
  void getCurrentUserNotFound() {
    UUID id = UUID.randomUUID();
    when(userRepository.findById(id)).thenReturn(Optional.empty());

    AuthException ex = assertThrows(AuthException.class, () -> authService.getCurrentUser(id));
    assertEquals(ErrorCode.USER_NOT_FOUND, ex.getErrorCode());
  }
}
