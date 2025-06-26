using System.Collections;
using UnityEngine;
using UnityEngine.Networking;
using UnityEngine.Events;

public class CrossChainCrafting : MonoBehaviour
{
    public string sourceChain;
    public string destChain;
    public string resource;
    public int amount;
    
    // Event for successful crafting
    public UnityEvent OnCraftingSuccess;
    
    // Event for failed crafting with error message
    public UnityEvent<string> OnCraftingFailed;

    void Start()
    {
        // Initialize wallet if not set
        if (string.IsNullOrEmpty(PlayerWallet.Address))
        {
            PlayerWallet.Address = PlayerPrefs.GetString("PlayerWalletAddress", "");
        }
    }
    
    public void InitiateCrafting()
    {
        StartCoroutine(ExecuteCrossChainCrafting());
    }
    
    private IEnumerator ExecuteCrossChainCrafting()
    {
        // Validate wallet
        if (string.IsNullOrEmpty(PlayerWallet.Address))
        {
            Debug.LogError("Player wallet not available");
            OnCraftingFailed?.Invoke("Wallet not initialized");
            yield break;
        }

        // MEV-resistant delay
        yield return new WaitForSeconds(Random.Range(2f, 5f));
        
        WWWForm form = new WWWForm();
        form.AddField("sourceChain", sourceChain);
        form.AddField("destChain", destChain);
        form.AddField("resource", resource);
        form.AddField("amount", amount.ToString());
        form.AddField("playerAddress", PlayerWallet.Address);
        
        using (UnityWebRequest www = UnityWebRequest.Post(
            "https://defi-craft.vercel.app/api/cross-chain/craft", form))
        {
            yield return www.SendWebRequest();
            
            if (www.result != UnityWebRequest.Result.Success)
            {
                string error = $"Cross-chain crafting failed: {www.error}";
                Debug.LogError(error);
                OnCraftingFailed?.Invoke(error);
            }
            else
            {
                Debug.Log("Cross-chain crafting completed!");
                OnCraftingSuccess?.Invoke();
            }
        }
    }
}

// Simplified PlayerWallet as a static class
public static class PlayerWallet
{
    public static string Address
    {
        get => PlayerPrefs.GetString("PlayerWalletAddress", "");
        set => PlayerPrefs.SetString("PlayerWalletAddress", value);
    }
}