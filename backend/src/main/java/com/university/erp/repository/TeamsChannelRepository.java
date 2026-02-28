package com.university.erp.repository;

import com.university.erp.model.TeamsChannel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TeamsChannelRepository extends JpaRepository<TeamsChannel, String> {

    List<TeamsChannel> findByProgramId(Long programId);

    List<TeamsChannel> findByYear(int year);

    @Query("SELECT tc FROM TeamsChannel tc JOIN tc.program p JOIN p.department d " +
           "WHERE UPPER(d.code) = UPPER(:deptCode) AND tc.year = :year AND tc.active = true")
    List<TeamsChannel> findByDeptCodeAndYear(@Param("deptCode") String deptCode,
                                              @Param("year") int year);

    @Query("SELECT tc FROM TeamsChannel tc JOIN tc.program p JOIN p.department d " +
           "WHERE UPPER(d.code) = UPPER(:deptCode) AND tc.active = true")
    List<TeamsChannel> findByDeptCode(@Param("deptCode") String deptCode);

    List<TeamsChannel> findByActiveTrue();
}
