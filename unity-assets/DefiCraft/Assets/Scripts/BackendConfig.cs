using UnityEngine;

public static class BackendConfig 
{
    // For development (local server)
    private const string LOCAL_BASE_URL = "http://localhost:4000/api";
    
    // For production (deployed server)
    private const string PRODUCTION_BASE_URL = "https://defi-craft.vercel.app/api";

    public static string BASE_URL 
    {
        get 
        {
            #if UNITY_EDITOR
                // Use local server during development in Unity Editor
                return LOCAL_BASE_URL;
            #elif DEVELOPMENT_BUILD
                // Use production URL for development builds
                return PRODUCTION_BASE_URL;
            #else
                // Use production URL for release builds
                return PRODUCTION_BASE_URL;
            #endif
        }
    }
}