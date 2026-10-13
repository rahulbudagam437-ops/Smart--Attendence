package com.smartattendance.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.core.env.Environment;

import javax.sql.DataSource;
import java.net.URI;

@Configuration
public class DatabaseConfig {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseConfig.class);

    private final Environment environment;

    public DatabaseConfig(Environment environment) {
        this.environment = environment;
    }

    @Bean
    @Primary
    public DataSource dataSource() {
        // 1. Check for Render DATABASE_URL or SPRING_DATASOURCE_URL or DB_URL
        String rawDatabaseUrl = getFirstNonEmpty(
                System.getenv("DATABASE_URL"),
                environment.getProperty("DATABASE_URL"),
                System.getenv("SPRING_DATASOURCE_URL"),
                environment.getProperty("spring.datasource.url"),
                System.getenv("DB_URL"),
                environment.getProperty("DB_URL")
        );

        if (rawDatabaseUrl != null && !rawDatabaseUrl.isBlank()) {
            logger.info("Configuring DataSource from environment URL...");
            return createDataSourceFromUrl(rawDatabaseUrl);
        }

        // 2. Check for individual host/port/user/pass credentials
        String dbHost = getFirstNonEmpty(System.getenv("DB_HOST"), environment.getProperty("DB_HOST"));
        if (dbHost != null && !dbHost.isBlank()) {
            String dbPort = getFirstNonEmpty(System.getenv("DB_PORT"), environment.getProperty("DB_PORT"), "5432");
            String dbName = getFirstNonEmpty(System.getenv("DB_NAME"), environment.getProperty("DB_NAME"), "smart_attendance");
            String dbUser = getFirstNonEmpty(System.getenv("DB_USER"), environment.getProperty("DB_USER"), "postgres");
            String dbPassword = getFirstNonEmpty(System.getenv("DB_PASSWORD"), environment.getProperty("DB_PASSWORD"), "");

            String jdbcUrl = "jdbc:postgresql://" + dbHost + ":" + dbPort + "/" + dbName;
            logger.info("Configuring PostgreSQL DataSource for host: {}:{}", dbHost, dbPort);

            HikariConfig config = new HikariConfig();
            config.setDriverClassName("org.postgresql.Driver");
            config.setJdbcUrl(jdbcUrl);
            config.setUsername(dbUser);
            config.setPassword(dbPassword);
            config.setMaximumPoolSize(10);
            config.setMinimumIdle(2);
            config.setConnectionTimeout(30000);
            config.setIdleTimeout(300000);
            return new HikariDataSource(config);
        }

        // 3. Fallback to default H2 in-memory for local dev / tests when no DB is configured
        logger.info("No external DATABASE_URL or DB_HOST found. Using default H2 in-memory database.");
        HikariConfig config = new HikariConfig();
        config.setDriverClassName("org.h2.Driver");
        config.setJdbcUrl("jdbc:h2:mem:smart_attendance;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE");
        config.setUsername("sa");
        config.setPassword("");
        return new HikariDataSource(config);
    }

    private DataSource createDataSourceFromUrl(String url) {
        HikariConfig config = new HikariConfig();

        if (url.startsWith("postgres://") || url.startsWith("postgresql://")) {
            try {
                // Parse Render/Heroku standard URI: postgres://user:password@host:port/database
                URI uri = new URI(url);
                String userInfo = uri.getUserInfo();
                String username = null;
                String password = null;
                if (userInfo != null) {
                    String[] parts = userInfo.split(":", 2);
                    username = parts[0];
                    if (parts.length > 1) {
                        password = parts[1];
                    }
                }

                int port = uri.getPort() > 0 ? uri.getPort() : 5432;
                String host = uri.getHost();
                String path = uri.getPath(); // /dbname

                StringBuilder jdbcUrl = new StringBuilder("jdbc:postgresql://")
                        .append(host)
                        .append(":")
                        .append(port)
                        .append(path);

                if (uri.getQuery() != null && !uri.getQuery().isBlank()) {
                    jdbcUrl.append("?").append(uri.getQuery());
                }

                logger.info("Parsed Render PostgreSQL URL successfully for host: {}:{}", host, port);
                config.setDriverClassName("org.postgresql.Driver");
                config.setJdbcUrl(jdbcUrl.toString());
                if (username != null) config.setUsername(username);
                if (password != null) config.setPassword(password);
                config.setMaximumPoolSize(10);
                config.setMinimumIdle(2);
                config.setConnectionTimeout(30000);
                config.setIdleTimeout(300000);
                return new HikariDataSource(config);
            } catch (Exception e) {
                logger.error("Failed to parse PostgreSQL URL as URI, using direct prefix transformation", e);
                String jdbcUrl = url.replaceFirst("^postgres://", "jdbc:postgresql://")
                                   .replaceFirst("^postgresql://", "jdbc:postgresql://");
                config.setDriverClassName("org.postgresql.Driver");
                config.setJdbcUrl(jdbcUrl);
                return new HikariDataSource(config);
            }
        } else if (url.startsWith("jdbc:mysql://")) {
            config.setDriverClassName("com.mysql.cj.jdbc.Driver");
            config.setJdbcUrl(url);
            String user = getFirstNonEmpty(System.getenv("DB_USER"), environment.getProperty("DB_USER"), "root");
            String pass = getFirstNonEmpty(System.getenv("DB_PASSWORD"), environment.getProperty("DB_PASSWORD"), "root");
            config.setUsername(user);
            config.setPassword(pass);
            return new HikariDataSource(config);
        } else {
            // Already standard jdbc:... format
            if (url.startsWith("jdbc:postgresql:")) {
                config.setDriverClassName("org.postgresql.Driver");
            }
            config.setJdbcUrl(url);
            String user = getFirstNonEmpty(System.getenv("DB_USER"), environment.getProperty("spring.datasource.username"), "postgres");
            String pass = getFirstNonEmpty(System.getenv("DB_PASSWORD"), environment.getProperty("spring.datasource.password"), "");
            config.setUsername(user);
            config.setPassword(pass);
            return new HikariDataSource(config);
        }
    }

    private String getFirstNonEmpty(String... values) {
        for (String v : values) {
            if (v != null && !v.trim().isEmpty()) {
                return v.trim();
            }
        }
        return null;
    }
}
