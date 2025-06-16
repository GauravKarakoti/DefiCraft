using UnityEngine;
using System.Collections;  // Add this namespace for IEnumerator

public class ExampleUsage : MonoBehaviour 
{
    void Start() 
    {
        StartCoroutine(FetchYieldData());
    }

    IEnumerator FetchYieldData() 
    {
        bool received = false;
        YieldData yieldData = null;
        string error = null;
        
        // Start the coroutine and provide callbacks
        yield return StartCoroutine(DeFiIntegration.GetYieldData("aave", 
            data => {
                yieldData = data;
                received = true;
            },
            err => {
                error = err;
                received = true;
            }
        ));
        
        yield return new WaitUntil(() => received);
        
        if (yieldData != null) 
        {
            Debug.Log($"Success! APY: {yieldData.apy}%, TVL: ${yieldData.tvl}");
        }
        else 
        {
            Debug.LogError($"Failed to fetch yield data: {error}");
        }
    }
}