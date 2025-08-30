package io.github.satvikg7.nanometrics.authservice.repository;

import io.github.satvikg7.nanometrics.authservice.entity.Site;
import io.github.satvikg7.nanometrics.authservice.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SiteRepository extends JpaRepository<Site, UUID> {
  List<Site> findByOwner(User owner);

  Optional<Site> findByDomain(String domain);

  boolean existsByDomain(String domain);
}
