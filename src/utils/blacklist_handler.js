
function apply_blacklist(blacklistCondition, results) {
    console.log('apply_blacklist called with condition:', blacklistCondition, 'and', results.length, 'results');
    
    if (!blacklistCondition || blacklistCondition.trim() === '') {
        console.log('No condition provided, returning original results');
        return results;
    }
    
    if (!results || !Array.isArray(results)) {
        console.log('Invalid results provided, returning original results');
        return results;
    }
    
    // Filter out results where video_name starts with the blacklist condition
    const filteredResults = results.filter(result => {
        if (!result || !result.video_name) {
            console.log('Result missing video_name:', result);
            return true; // Keep results without video_name
        }
        
        const videoName = result.video_name.toUpperCase();
        const normalizedCondition = blacklistCondition.toUpperCase();
        
        // Handle wildcard patterns - convert * to proper regex
        let shouldRemove = false;
        if (normalizedCondition.includes('*')) {
            // Convert wildcard pattern to regex
            // Escape special regex characters except *
            const escapedCondition = normalizedCondition.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
            const regexPattern = escapedCondition.replace(/\*/g, '.*');
            const regex = new RegExp('^' + regexPattern + '$');
            shouldRemove = regex.test(videoName);
        } else {
            // Simple startsWith for non-wildcard conditions
            shouldRemove = videoName.startsWith(normalizedCondition);
        }
        
        return !shouldRemove; // Keep if not matching the blacklist condition
    });
    
    console.log(`Filtered from ${results.length} to ${filteredResults.length} results`);
    return filteredResults;
}

function apply_include(includeCondition, results) {

    
    if (!includeCondition || includeCondition.trim() === '') {
        
        return [];
    }
    
    if (!results || !Array.isArray(results)) {
        
        return [];
    }
    
    // Filter to keep only results where video_name matches the include condition
    const includedResults = results.filter(result => {
        if (!result || !result.video_name) {
            
            return false; // Exclude results without video_name
        }
        
        const videoName = result.video_name.toUpperCase();
        const normalizedCondition = includeCondition.toUpperCase();
        
        // Handle wildcard patterns - convert * to proper regex
        let shouldInclude = false;
        if (normalizedCondition.includes('*')) {
            // Convert wildcard pattern to regex
            // Escape special regex characters except *
            const escapedCondition = normalizedCondition.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
            const regexPattern = escapedCondition.replace(/\*/g, '.*');
            const regex = new RegExp('^' + regexPattern + '$');
            shouldInclude = regex.test(videoName);
        } else {
            // Simple startsWith for non-wildcard conditions
            shouldInclude = videoName.startsWith(normalizedCondition);
        }
        
        
        return shouldInclude; // Keep if matching the include condition
    });
    
    console.log(`Included ${includedResults.length} out of ${results.length} results`);
    return includedResults;
}

export { apply_blacklist, apply_include };