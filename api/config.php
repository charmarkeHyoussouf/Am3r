<?php
/**
 * Am3r Group API Configuration
 * IMPORTANT: Move this file ABOVE web root on production server
 */

// CAPTCHA secret — change this to a strong random string in production
define('CAPTCHA_SECRET', 'CHANGE_ME_TO_A_RANDOM_SECRET_KEY_64_CHARS');

// Database credentials
define('DB_HOST', 'localhost');
define('DB_NAME', 'am3rgroup_db');
define('DB_USER', 'am3rgroup_user');
define('DB_PASS', 'CHANGE_ME');

// Allowed origin for CORS
define('ALLOWED_ORIGIN', 'https://www.am3rgroup.com');

// Token expiry in seconds
define('TOKEN_EXPIRY', 120);

// Minimum behavior score
define('MIN_SCORE', 0.4);

// Rate limits
define('CAPTCHA_RATE_LIMIT', 20);   // per 15 min
define('WAITLIST_RATE_LIMIT', 10);  // per 15 min
define('RATE_WINDOW', 900);         // 15 minutes in seconds
