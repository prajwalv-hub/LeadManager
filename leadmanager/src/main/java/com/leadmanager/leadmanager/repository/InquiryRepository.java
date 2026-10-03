package com.leadmanager.leadmanager.repository;

import com.leadmanager.leadmanager.entity.Inquiry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface InquiryRepository extends JpaRepository<Inquiry, Long> {

    long countByCreatedAtBetween(
            LocalDateTime from,
            LocalDateTime to
    );

    List<Inquiry> findByStatusOrderByCreatedAtAsc(String status);

    List<Inquiry> findByStatusOrderByHandledAtDesc(String status);
}