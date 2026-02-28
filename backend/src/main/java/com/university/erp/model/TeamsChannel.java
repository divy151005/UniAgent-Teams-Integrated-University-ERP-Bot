package com.university.erp.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "teams_channels")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeamsChannel {

    @Id
    @Column(nullable = false, unique = true)
    private String channelId;    // e.g. CH001

    @Column(nullable = false)
    private String channelName;  // e.g. CSE_BTech_1st_Year

    @Column(name = "academic_year")
    private int year;            // academic year 1-4

    private String section;      // A, B, C...

    private int memberCount;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "program_id", nullable = false)
    private Program program;

    private boolean active;
}
