package com.university.erp.repository;

import com.university.erp.model.TeamsChannel;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TeamsChannelRepository extends MongoRepository<TeamsChannel, String> {

    List<TeamsChannel> findByProgramId(String programId);

    List<TeamsChannel> findByYear(int year);

    @Query("{'programId': ?0, 'year': ?1, 'active': true}")
    List<TeamsChannel> findByDeptCodeAndYear(@Param("deptCode") String deptCode,
                                              @Param("year") int year);

    @Query("{'programId': ?0, 'active': true}")
    List<TeamsChannel> findByDeptCode(@Param("deptCode") String deptCode);

    List<TeamsChannel> findByActiveTrue();
}
