using System.Collections;
using UnityEngine;
using UnityEngine.Networking;
using UnityEngine.UI;

public class WorkshopManager : MonoBehaviour
{
    public string workshopType;
    public string ownerAddress;
    public float craftTime;
    public Slider progressSlider;
    
    private bool isProducing;
    private float productionStartTime;
    
    void Start()
    {
        LoadWorkshopData();
    }
    
    private void LoadWorkshopData()
    {
        // Load config from Resources
        TextAsset configFile = Resources.Load<TextAsset>("config");
        WorkshopConfig config = JsonUtility.FromJson<WorkshopConfig>(configFile.text);
        
        // Set craft time based on type
        switch (workshopType)
        {
            case "Basic":
                craftTime = config.gameSettings.craftingTimes[0];
                break;
            case "Advanced":
                craftTime = config.gameSettings.craftingTimes[1];
                break;
            case "Elite":
                craftTime = config.gameSettings.craftingTimes[2];
                break;
            default:
                craftTime = 60f;
                break;
        }
    }
    
    public void StartProduction()
    {
        if (isProducing) return;
        
        isProducing = true;
        productionStartTime = Time.time;
        StartCoroutine(ProductionProcess());
    }
    
    private IEnumerator ProductionProcess()
    {
        while (isProducing)
        {
            float elapsed = Time.time - productionStartTime;
            float progress = Mathf.Clamp01(elapsed / craftTime);
            
            progressSlider.value = progress;
            
            if (progress >= 1f)
            {
                CompleteProduction();
                yield break;
            }
            
            yield return null;
        }
    }
    
    private void CompleteProduction()
    {
        isProducing = false;
        progressSlider.value = 0f;
        
        // Claim rewards on blockchain
        StartCoroutine(ClaimProductionRewards());
    }
    
    private IEnumerator ClaimProductionRewards()
    {
        WWWForm form = new WWWForm();
        form.AddField("playerAddress", ownerAddress);
        form.AddField("workshopType", workshopType);
        
        using (UnityWebRequest www = UnityWebRequest.Post(
            "https://defi-craft.vercel.app/api/workshop/claim", form))
        {
            yield return www.SendWebRequest();
            
            if (www.result != UnityWebRequest.Result.Success)
            {
                Debug.LogError($"Claim failed: {www.error}");
            }
            else
            {
                Debug.Log("Production rewards claimed!");
                // Show reward animation
            }
        }
    }
}

[System.Serializable]
public class WorkshopConfig
{
    public int chainId;
    public string rpcUrl;
    public ContractAddresses contractAddresses;
    public string paymasterUrl;
    public GameSettings gameSettings;
}

[System.Serializable]
public class ContractAddresses
{
    public string workshopFactory;
    public string craftToken;
    public string stakingAmulet;
}

[System.Serializable]
public class GameSettings
{
    public string[] defaultWorkshops;
    public float[] craftingTimes;
    public int[] tgeQuestIds;
}