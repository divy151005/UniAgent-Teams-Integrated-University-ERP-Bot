package com.university.erp.repository;

import com.university.erp.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findByStatusOrderByCreatedAtDesc(Message.MessageStatus status);

    List<Message> findByIntentOrderByCreatedAtDesc(String intent);

    List<Message> findAllByOrderByCreatedAtDesc();

    long countByStatus(Message.MessageStatus status);

    long countByIntent(String intent);

    @Query("SELECT COUNT(m) FROM Message m WHERE m.erpSynced = true")
    long countErpSynced();
}
