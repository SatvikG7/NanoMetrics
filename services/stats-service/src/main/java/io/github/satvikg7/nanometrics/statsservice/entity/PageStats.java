package io.github.satvikg7.nanometrics.statsservice.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Field;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PageStats {

  @Field("url")
  private String url;

  @Field("pageviews")
  private Long pageviews;

  @Field("visitors")
  private Long visitors;
}
