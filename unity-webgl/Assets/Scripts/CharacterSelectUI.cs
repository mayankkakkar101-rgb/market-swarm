using UnityEngine;
using UnityEngine.UI;

namespace MarketSwarm
{
    public sealed class CharacterSelectUI : MonoBehaviour
    {
        [SerializeField] private Button pmButton;
        [SerializeField] private Button pappuButton;

        private GameManager manager;

        public void Bind(GameManager gameManager)
        {
            manager = gameManager;
            pmButton.onClick.RemoveAllListeners();
            pappuButton.onClick.RemoveAllListeners();
            pmButton.onClick.AddListener(() => manager.SelectCharacter(CharacterId.PM));
            pappuButton.onClick.AddListener(() => manager.SelectCharacter(CharacterId.Pappu));
        }
    }
}
