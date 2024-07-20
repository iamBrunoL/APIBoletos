let blacklistedTokens = new Set();

// Agrega un token a la lista negra
function blacklistToken(token) {
    blacklistedTokens.add(token);
}

// Verifica si un token está en la lista negra
function isTokenBlacklisted(token) {
    return blacklistedTokens.has(token);
}

module.exports = { blacklistToken, isTokenBlacklisted };
