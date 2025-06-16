using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Networking;

public class GuildBattleSystem : MonoBehaviour
{
    public string guildId;
    public string opponentGuildId;
    public float battleDuration = 600f; // 10 minutes
    public float updateInterval = 30f;
    
    private float battleStartTime;
    private float lastUpdateTime;
    private bool battleActive;
    
    void Start()
    {
        battleActive = false;
    }
    
    public void StartBattle(string opponentId)
    {
        if (battleActive) return;
        
        opponentGuildId = opponentId;
        battleStartTime = Time.time;
        battleActive = true;
        lastUpdateTime = Time.time;
        
        StartCoroutine(BattleLoop());
    }
    
    private IEnumerator BattleLoop()
    {
        while (battleActive && Time.time < battleStartTime + battleDuration)
        {
            if (Time.time - lastUpdateTime > updateInterval)
            {
                yield return StartCoroutine(UpdateBattleStats());
                lastUpdateTime = Time.time;
            }
            yield return null;
        }
        
        if (battleActive)
        {
            EndBattle();
        }
    }
    
    private IEnumerator UpdateBattleStats()
    {
        // Get guild stats from backend
        WWWForm form = new WWWForm();
        form.AddField("guildId", guildId);
        form.AddField("opponentId", opponentGuildId);
        
        using (UnityWebRequest www = UnityWebRequest.Post(
            "https://defi-craft.vercel.app/api/guild/battle", form))
        {
            yield return www.SendWebRequest();
            
            if (www.result != UnityWebRequest.Result.Success)
            {
                Debug.LogError($"Battle update failed: {www.error}");
            }
            else
            {
                // Process battle data
                Debug.Log("Battle stats updated");
            }
        }
    }
    
    private void EndBattle()
    {
        battleActive = false;
        StartCoroutine(ResolveBattle());
    }
    
    private IEnumerator ResolveBattle()
    {
        WWWForm form = new WWWForm();
        form.AddField("guildId", guildId);
        form.AddField("opponentId", opponentGuildId);
        
        using (UnityWebRequest www = UnityWebRequest.Post(
            "https://defi-craft.vercel.app/api/guild/resolve", form))
        {
            yield return www.SendWebRequest();
            
            if (www.result != UnityWebRequest.Result.Success)
            {
                Debug.LogError($"Battle resolution failed: {www.error}");
            }
            else
            {
                Debug.Log("Battle resolved successfully");
                // Process rewards
            }
        }
    }
}