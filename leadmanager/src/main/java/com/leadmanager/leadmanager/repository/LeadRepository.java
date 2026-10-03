package com.leadmanager.leadmanager.repository;

import com.leadmanager.leadmanager.entity.Lead;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface LeadRepository extends JpaRepository<Lead, Long> {

    List<Lead> findByStatus(String status);

    List<Lead> findBySource(String source);

    List<Lead> findByPropertyType(String propertyType);

    Optional<Lead> findByPhone(String phone);

    long countByCreatedAtBetween(
            LocalDateTime from,
            LocalDateTime to
    );
}