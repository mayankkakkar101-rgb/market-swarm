using TMPro;
using UnityEngine;
using UnityEngine.UI;

namespace MarketSwarm
{
    public sealed class HUDController : MonoBehaviour
    {
        [SerializeField] private TMP_Text timerText;
        [SerializeField] private TMP_Text killsText;
        [SerializeField] private TMP_Text nameText;
        [SerializeField] private TMP_Text weaponText;
        [SerializeField] private Image portraitImage;
        [SerializeField] private Image healthFill;
        [SerializeField] private Image staminaFill;

        private GameManager manager;

        public void Bind(GameManager gameManager)
        {
            if (manager != null)
            {
                manager.OnSnapshotChanged -= Refresh;
            }

            manager = gameManager;
            manager.OnSnapshotChanged += Refresh;
            Refresh();
        }

        private void OnDestroy()
        {
            if (manager != null)
            {
                manager.OnSnapshotChanged -= Refresh;
            }
        }

        private void Refresh()
        {
            if (manager == null)
            {
                return;
            }

            int seconds = Mathf.CeilToInt(manager.TimeRemaining);
            timerText.text = $"{seconds / 60}:{seconds % 60:00}";
            killsText.text = $"KILLS: {manager.KillCount}";

            CharacterDefinition selected = manager.SelectedCharacter;
            if (selected != null)
            {
                nameText.text = selected.displayName;
                weaponText.text = selected.weaponName;
                portraitImage.sprite = selected.portrait;
            }

            PlayerController player = manager.Player;
            if (player != null)
            {
                healthFill.fillAmount = player.Health / player.MaxHealth;
                staminaFill.fillAmount = player.Stamina / player.MaxStamina;
            }
        }
    }
}
