package io.github.satvikg7.nanometrics.statsservice.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.AbstractMongoClientConfiguration;

@Configuration
public class MongoConfig extends AbstractMongoClientConfiguration {

    @Override
    protected String getDatabaseName() {
        return "nanometrics";
    }

    @Override
    protected boolean autoIndexCreation() {
        return true;
    }
}
