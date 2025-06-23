using UnityEngine;
using System.Collections;
using UnityEngine.Networking; // Add this namespace for UnityWebRequest

public class PaymasterIntegration : MonoBehaviour
{
    public static IEnumerator GetGasCoverage(string playerAddress, 
        System.Action<CoverageData> onSuccess, 
        System.Action<string> onError)
    {
        string url = $"{BackendConfig.BASE_URL}/paymaster/rules/{playerAddress}";
        
        using (UnityWebRequest webRequest = UnityWebRequest.Get(url))
        {
            yield return webRequest.SendWebRequest();
            
            if (webRequest.result == UnityWebRequest.Result.Success)
            {
                CoverageData data = JsonUtility.FromJson<CoverageData>(webRequest.downloadHandler.text);
                onSuccess?.Invoke(data);
            }
            else
            {
                onError?.Invoke($"Paymaster error: {webRequest.error}");
            }
        }
    }

    public static IEnumerator SponsorTransaction(string playerAddress, object txData,
        System.Action<SponsoredTx> onSuccess,
        System.Action<string> onError)
    {
        string url = $"{BackendConfig.BASE_URL}/paymaster/sponsor";
        string jsonData = JsonUtility.ToJson(new {
            playerAddress,
            txData
        });

        // Create proper POST request
        using (UnityWebRequest webRequest = new UnityWebRequest(url, "POST"))
        {
            byte[] bodyRaw = System.Text.Encoding.UTF8.GetBytes(jsonData);
            webRequest.uploadHandler = new UploadHandlerRaw(bodyRaw);
            webRequest.downloadHandler = new DownloadHandlerBuffer();
            webRequest.SetRequestHeader("Content-Type", "application/json");
            
            yield return webRequest.SendWebRequest();
            
            if (webRequest.result == UnityWebRequest.Result.Success)
            {
                SponsoredTx result = JsonUtility.FromJson<SponsoredTx>(webRequest.downloadHandler.text);
                onSuccess?.Invoke(result);
            }
            else
            {
                onError?.Invoke($"Sponsor error: {webRequest.error}");
            }
        }
    }
}

[System.Serializable]
public class CoverageData
{
    public float percentage;
    public int level;
    public float userGasRequired;
}

[System.Serializable]
public class SponsoredTx
{
    public string sponsoredTx;
    public float gasSponsored;
}