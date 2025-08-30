package io.github.satvikg7.nanometrics.authservice.service;

import io.github.satvikg7.nanometrics.authservice.dto.LoginRequest;
import io.github.satvikg7.nanometrics.authservice.dto.RegisterRequest;
import io.github.satvikg7.nanometrics.authservice.dto.UserResponse;
import io.github.satvikg7.nanometrics.authservice.entity.User;
import io.github.satvikg7.nanometrics.authservice.enums.ErrorCode;
import io.github.satvikg7.nanometrics.authservice.exception.AuthException;
import io.github.satvikg7.nanometrics.authservice.repository.UserRepository;
import io.github.satvikg7.nanometrics.authservice.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtUtil jwtUtil;

  public String login(LoginRequest request) {
    User user = userRepository.findByUsername(request.getUsername())
        .orElseThrow(() -> new AuthException(ErrorCode.INVALID_CREDENTIALS));

    if (!passwordEncoder.matches(request.getPassword(), user.getPasshash())) {
      throw new AuthException(ErrorCode.INVALID_CREDENTIALS);
    }

    return jwtUtil.generateToken(user.getId(), user.getUsername());
  }

  public UserResponse register(RegisterRequest request) {
    if (userRepository.existsByUsername(request.getUsername())) {
      throw new AuthException(ErrorCode.USERNAME_ALREADY_EXISTS);
    }

    if (userRepository.existsByEmail(request.getEmail())) {
      throw new AuthException(ErrorCode.EMAIL_ALREADY_EXISTS);
    }

    User user = new User();
    user.setUsername(request.getUsername());
    user.setFname(request.getFname());
    user.setLname(request.getLname());
    user.setEmail(request.getEmail());
    user.setPasshash(passwordEncoder.encode(request.getPassword()));

    User savedUser = userRepository.save(user);
    return mapToUserResponse(savedUser);
  }

  public UserResponse getCurrentUser(UUID userId) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new AuthException(ErrorCode.USER_NOT_FOUND));
    return mapToUserResponse(user);
  }

  private UserResponse mapToUserResponse(User user) {
    UserResponse response = new UserResponse();
    response.setId(user.getId());
    response.setUsername(user.getUsername());
    response.setFname(user.getFname());
    response.setLname(user.getLname());
    response.setEmail(user.getEmail());
    response.setCreatedAt(user.getCreatedAt());
    response.setUpdatedAt(user.getUpdatedAt());
    return response;
  }
}
