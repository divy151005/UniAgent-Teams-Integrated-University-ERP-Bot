package com.university.erp.repository;

import com.university.erp.model.Message;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MessageRepository extends MongoRepository<Message, Long> {

    List<Message> findByStatusOrderByCreatedAtDesc(Message.MessageStatus status);

    List<Message> findByIntentOrderByCreatedAtDesc(String intent);

    List<Message> findAllByOrderByCreatedAtDesc();

    long countByStatus(Message.MessageStatus status);

    long countByIntent(String intent);

    @Query("{'erpSynced': true}")
    long countErpSynced();
}
