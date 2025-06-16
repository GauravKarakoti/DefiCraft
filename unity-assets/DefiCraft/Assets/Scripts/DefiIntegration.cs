using System.Collections;
using UnityEngine;
using UnityEngine.Networking;

public class DeFiIntegration : MonoBehaviour 
{
    // Make this a non-static coroutine
    public static IEnumerator GetYieldData(string protocol, System.Action<YieldData> onSuccess, System.Action<string> onError) 
    {
        string url = $"{BackendConfig.BASE_URL}/yield?protocol={UnityWebRequest.EscapeURL(protocol)}";
        
        using (UnityWebRequest webRequest = UnityWebRequest.Get(url)) 
        {
            yield return webRequest.SendWebRequest();
            
            if (webRequest.result == UnityWebRequest.Result.Success) 
            {
                try 
                {
                    YieldData data = JsonUtility.FromJson<YieldData>(webRequest.downloadHandler.text);
                    onSuccess?.Invoke(data);
                }
                catch (System.Exception e)
                {
                    onError?.Invoke($"JSON parse error: {e.Message}");
                }
            } 
            else 
            {
                onError?.Invoke($"Network error: {webRequest.error}");
            }
        }
    }
}

[System.Serializable]
public class YieldData 
{
    public string protocol;
    public float apy;
    public float tvl;
}