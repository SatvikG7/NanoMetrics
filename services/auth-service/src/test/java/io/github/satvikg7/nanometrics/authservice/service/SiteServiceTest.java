package io.github.satvikg7.nanometrics.authservice.service;

import io.github.satvikg7.nanometrics.authservice.dto.SiteRequest;
import io.github.satvikg7.nanometrics.authservice.entity.Site;
import io.github.satvikg7.nanometrics.authservice.entity.User;
import io.github.satvikg7.nanometrics.authservice.enums.ErrorCode;
import io.github.satvikg7.nanometrics.authservice.exception.AuthException;
import io.github.satvikg7.nanometrics.authservice.repository.SiteRepository;
import io.github.satvikg7.nanometrics.authservice.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SiteServiceTest {

  @Mock
  private SiteRepository siteRepository;

  @Mock
  private UserRepository userRepository;

  @InjectMocks
  private SiteService siteService;

  private UUID userId;
  private User user;
  private UUID siteId;
  private Site site;

  @BeforeEach
  void setUp() {
    userId = UUID.randomUUID();
    user = new User();
    user.setId(userId);

    siteId = UUID.randomUUID();
    site = new Site();
    site.setId(siteId);
    site.setDomain("example.com");
    site.setOwner(user);
  }

  @Test
  void createSiteSuccess() {
    SiteRequest req = new SiteRequest();
    req.setDomain("example.com");

    when(siteRepository.existsByDomain("example.com")).thenReturn(false);
    when(userRepository.findById(userId)).thenReturn(Optional.of(user));
    when(siteRepository.save(any(Site.class))).thenReturn(site);

    Site result = siteService.createSite(req, userId);

    assertNotNull(result);
    assertEquals(siteId, result.getId());
    assertEquals("example.com", result.getDomain());
    assertEquals(user, result.getOwner());
  }

  @Test
  void createSiteDomainExists() {
    SiteRequest req = new SiteRequest();
    req.setDomain("dup.com");
    when(siteRepository.existsByDomain("dup.com")).thenReturn(true);

    AuthException ex = assertThrows(AuthException.class, () -> siteService.createSite(req, userId));
    assertEquals(ErrorCode.DOMAIN_ALREADY_EXISTS, ex.getErrorCode());
  }

  @Test
  void createSiteUserNotFound() {
    SiteRequest req = new SiteRequest();
    req.setDomain("new.com");
    when(siteRepository.existsByDomain("new.com")).thenReturn(false);
    when(userRepository.findById(userId)).thenReturn(Optional.empty());

    AuthException ex = assertThrows(AuthException.class, () -> siteService.createSite(req, userId));
    assertEquals(ErrorCode.USER_NOT_FOUND, ex.getErrorCode());
  }

  @Test
  void getUserSitesSuccess() {
    List<Site> sites = Arrays.asList(site);
    when(userRepository.findById(userId)).thenReturn(Optional.of(user));
    when(siteRepository.findByOwner(user)).thenReturn(sites);

    List<Site> result = siteService.getUserSites(userId);

    assertEquals(1, result.size());
    assertSame(site, result.get(0));
  }

  @Test
  void getUserSitesUserNotFound() {
    when(userRepository.findById(userId)).thenReturn(Optional.empty());

    AuthException ex = assertThrows(AuthException.class, () -> siteService.getUserSites(userId));
    assertEquals(ErrorCode.USER_NOT_FOUND, ex.getErrorCode());
  }

  @Test
  void getSiteSuccess() {
    when(siteRepository.findById(siteId)).thenReturn(Optional.of(site));

    Site result = siteService.getSite(siteId, userId);

    assertEquals(site, result);
  }

  @Test
  void getSiteNotFound() {
    when(siteRepository.findById(siteId)).thenReturn(Optional.empty());

    AuthException ex = assertThrows(AuthException.class, () -> siteService.getSite(siteId, userId));
    assertEquals(ErrorCode.SITE_NOT_FOUND, ex.getErrorCode());
  }

  @Test
  void getSiteAccessDenied() {
    User wrongOwner = new User();
    wrongOwner.setId(UUID.randomUUID());
    Site other = new Site();
    other.setId(siteId);
    other.setDomain("a.com");
    other.setOwner(wrongOwner);
    when(siteRepository.findById(siteId)).thenReturn(Optional.of(other));

    AuthException ex = assertThrows(AuthException.class, () -> siteService.getSite(siteId, userId));
    assertEquals(ErrorCode.ACCESS_DENIED, ex.getErrorCode());
  }

  @Test
  void updateSiteSuccess() {
    SiteRequest req = new SiteRequest();
    req.setDomain("updated.com");
    when(siteRepository.findById(siteId)).thenReturn(Optional.of(site));
    // no existing domain conflict
    when(siteRepository.existsByDomain("updated.com")).thenReturn(false);
    when(siteRepository.save(site)).thenReturn(site);

    Site result = siteService.updateSite(siteId, req, userId);
    assertEquals("updated.com", result.getDomain());
  }

  @Test
  void updateSiteDomainExists() {
    SiteRequest req = new SiteRequest();
    req.setDomain("dup.com");
    when(siteRepository.findById(siteId)).thenReturn(Optional.of(site));
    when(siteRepository.existsByDomain("dup.com")).thenReturn(true);

    AuthException ex = assertThrows(AuthException.class, () -> siteService.updateSite(siteId, req, userId));
    assertEquals(ErrorCode.DOMAIN_ALREADY_EXISTS, ex.getErrorCode());
  }

  @Test
  void deleteSiteSuccess() {
    when(siteRepository.findById(siteId)).thenReturn(Optional.of(site));

    siteService.deleteSite(siteId, userId);

    verify(siteRepository, times(1)).delete(site);
  }

  @Test
  void deleteSiteNotFound() {
    when(siteRepository.findById(siteId)).thenReturn(Optional.empty());

    AuthException ex = assertThrows(AuthException.class, () -> siteService.deleteSite(siteId, userId));
    assertEquals(ErrorCode.SITE_NOT_FOUND, ex.getErrorCode());
  }

  @Test
  void deleteSiteAccessDenied() {
    User wrongOwner2 = new User();
    wrongOwner2.setId(UUID.randomUUID());
    Site other2 = new Site();
    other2.setId(siteId);
    other2.setDomain("x.com");
    other2.setOwner(wrongOwner2);
    when(siteRepository.findById(siteId)).thenReturn(Optional.of(other2));

    AuthException ex = assertThrows(AuthException.class, () -> siteService.deleteSite(siteId, userId));
    assertEquals(ErrorCode.ACCESS_DENIED, ex.getErrorCode());
  }
}
