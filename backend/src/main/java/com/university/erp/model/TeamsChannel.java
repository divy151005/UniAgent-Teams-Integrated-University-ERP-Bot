package com.university.erp.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import lombok.*;

@Document(collection = "teams_channels")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeamsChannel {

    @Id
    @Field(name = "channel_id")
    private String channelId;    // e.g. CH001

    @Field(name = "channel_name")
    private String channelName;  // e.g. CSE_BTech_1st_Year

    @Field(name = "academic_year")
    private int year;            // academic year 1-4

    private String section;      // A, B, C...

    @Field(name = "member_count")
    private int memberCount;

    @Field(name = "program_id")
    private Long programId;

    private boolean active;
}
