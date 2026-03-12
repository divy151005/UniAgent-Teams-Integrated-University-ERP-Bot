package com.university.erp.repository;

import com.university.erp.model.School;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface SchoolRepository extends MongoRepository<School, String> {
    Optional<School> findByCode(String code);
}
