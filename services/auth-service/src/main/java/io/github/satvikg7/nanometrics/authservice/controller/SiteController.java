package io.github.satvikg7.nanometrics.authservice.controller;

import io.github.satvikg7.nanometrics.authservice.dto.SiteRequest;
import io.github.satvikg7.nanometrics.authservice.dto.SiteResponse;
import io.github.satvikg7.nanometrics.authservice.entity.Site;
import io.github.satvikg7.nanometrics.authservice.response.ApiResponse;
import io.github.satvikg7.nanometrics.authservice.service.SiteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/sites")
@RequiredArgsConstructor
public class SiteController {

  private final SiteService siteService;

  @PostMapping
  public ResponseEntity<ApiResponse<SiteResponse>> createSite(@Valid @RequestBody SiteRequest request,
      Authentication authentication) {
    UUID userId = (UUID) authentication.getPrincipal();
    Site site = siteService.createSite(request, userId);
    SiteResponse response = mapToSiteResponse(site);
    return ResponseEntity.ok(ApiResponse.success(response, "Site created successfully"));
  }

  @GetMapping
  public ResponseEntity<ApiResponse<List<SiteResponse>>> getUserSites(Authentication authentication) {
    UUID userId = (UUID) authentication.getPrincipal();
    List<Site> sites = siteService.getUserSites(userId);
    List<SiteResponse> responses = sites.stream().map(this::mapToSiteResponse).toList();
    return ResponseEntity.ok(ApiResponse.success(responses));
  }

  @GetMapping("/{siteId}")
  public ResponseEntity<ApiResponse<SiteResponse>> getSite(@PathVariable UUID siteId,
      Authentication authentication) {
    UUID userId = (UUID) authentication.getPrincipal();
    Site site = siteService.getSite(siteId, userId);
    SiteResponse response = mapToSiteResponse(site);
    return ResponseEntity.ok(ApiResponse.success(response));
  }

  @PutMapping("/{siteId}")
  public ResponseEntity<ApiResponse<SiteResponse>> updateSite(@PathVariable UUID siteId,
      @Valid @RequestBody SiteRequest request,
      Authentication authentication) {
    UUID userId = (UUID) authentication.getPrincipal();
    Site site = siteService.updateSite(siteId, request, userId);
    SiteResponse response = mapToSiteResponse(site);
    return ResponseEntity.ok(ApiResponse.success(response, "Site updated successfully"));
  }

  @DeleteMapping("/{siteId}")
  public ResponseEntity<ApiResponse<String>> deleteSite(@PathVariable UUID siteId,
      Authentication authentication) {
    UUID userId = (UUID) authentication.getPrincipal();
    siteService.deleteSite(siteId, userId);
    return ResponseEntity.ok(ApiResponse.success("Site deleted successfully"));
  }

  private SiteResponse mapToSiteResponse(Site site) {
    SiteResponse response = new SiteResponse();
    response.setId(site.getId());
    response.setDomain(site.getDomain());
    response.setOwnerId(site.getOwner().getId());
    response.setCreatedAt(site.getCreatedAt());
    response.setUpdatedAt(site.getUpdatedAt());
    return response;
  }
}
