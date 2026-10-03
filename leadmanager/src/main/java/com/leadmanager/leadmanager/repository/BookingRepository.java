package com.leadmanager.leadmanager.repository;

import com.leadmanager.leadmanager.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByBookingDateBetween(
            LocalDate from,
            LocalDate to
    );
}