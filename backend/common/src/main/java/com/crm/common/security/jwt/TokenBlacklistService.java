package com.crm.common.security.jwt;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.concurrent.TimeUnit;

/**
 * Service for managing JWT token blacklist in Redis
 * Used to invalidate tokens on logout
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TokenBlacklistService {

    private final RedisTemplate<String, String> redisTemplate;
    private final JwtUtil jwtUtil;

    private static final String BLACKLIST_PREFIX = "blacklist:token:";

    /**
     * Add token to blacklist
     */
    public void blacklistToken(String token) {
        try {
            Date expirationDate = jwtUtil.getExpirationDateFromToken(token);
            long ttl = expirationDate.getTime() - System.currentTimeMillis();

            if (ttl > 0) {
                String key = BLACKLIST_PREFIX + token;
                redisTemplate.opsForValue().set(key, "blacklisted", ttl, TimeUnit.MILLISECONDS);
                log.info("Token added to blacklist with TTL: {} ms", ttl);
            }
        } catch (Exception e) {
            log.error("Error blacklisting token", e);
        }
    }

    /**
     * Check if token is blacklisted
     */
    public boolean isTokenBlacklisted(String token) {
        String key = BLACKLIST_PREFIX + token;
        Boolean exists = redisTemplate.hasKey(key);
        return Boolean.TRUE.equals(exists);
    }

    /**
     * Remove token from blacklist (if needed for testing)
     */
    public void removeTokenFromBlacklist(String token) {
        String key = BLACKLIST_PREFIX + token;
        redisTemplate.delete(key);
        log.info("Token removed from blacklist");
    }
}
