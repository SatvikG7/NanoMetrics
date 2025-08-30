package io.github.satvikg7.nanometrics.authservice.service;

import io.github.satvikg7.nanometrics.authservice.dto.SiteRequest;
import io.github.satvikg7.nanometrics.authservice.entity.Site;
import io.github.satvikg7.nanometrics.authservice.entity.User;
import io.github.satvikg7.nanometrics.authservice.enums.ErrorCode;
import io.github.satvikg7.nanometrics.authservice.exception.AuthException;
import io.github.satvikg7.nanometrics.authservice.repository.SiteRepository;
import io.github.satvikg7.nanometrics.authservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SiteService {

  private final SiteRepository siteRepository;
  private final UserRepository userRepository;

  public Site createSite(SiteRequest request, UUID userId) {
    if (siteRepository.existsByDomain(request.getDomain())) {
      throw new AuthException(ErrorCode.DOMAIN_ALREADY_EXISTS);
    }

    User user = userRepository.findById(userId)
        .orElseThrow(() -> new AuthException(ErrorCode.USER_NOT_FOUND));

    Site site = new Site();
    site.setDomain(request.getDomain());
    site.setOwner(user);

    return siteRepository.save(site);
  }

  public List<Site> getUserSites(UUID userId) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new AuthException(ErrorCode.USER_NOT_FOUND));

    return siteRepository.findByOwner(user);
  }

  public Site getSite(UUID siteId, UUID userId) {
    Site site = siteRepository.findById(siteId)
        .orElseThrow(() -> new AuthException(ErrorCode.SITE_NOT_FOUND));

    if (!site.getOwner().getId().equals(userId)) {
      throw new AuthException(ErrorCode.ACCESS_DENIED);
    }

    return site;
  }

  public Site updateSite(UUID siteId, SiteRequest request, UUID userId) {
    Site site = getSite(siteId, userId);

    if (!site.getDomain().equals(request.getDomain()) &&
        siteRepository.existsByDomain(request.getDomain())) {
      throw new AuthException(ErrorCode.DOMAIN_ALREADY_EXISTS);
    }

    site.setDomain(request.getDomain());
    return siteRepository.save(site);
  }

  public void deleteSite(UUID siteId, UUID userId) {
    Site site = getSite(siteId, userId);
    siteRepository.delete(site);
  }
}
