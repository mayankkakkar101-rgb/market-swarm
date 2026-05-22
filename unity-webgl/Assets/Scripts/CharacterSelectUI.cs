using UnityEngine;
using UnityEngine.UI;

namespace MarketSwarm
{
    public sealed class CharacterSelectUI : MonoBehaviour
    {
        [SerializeField] private Button mitroooButton;
        [SerializeField] private Button pappuButton;

        private GameManager manager;

        public void Bind(GameManager gameManager)
        {
            manager = gameManager;
            mitroooButton.onClick.RemoveAllListeners();
            pappuButton.onClick.RemoveAllListeners();
            mitroooButton.onClick.AddListener(() => manager.SelectCharacter(CharacterId.Mitrooo));
            pappuButton.onClick.AddListener(() => manager.SelectCharacter(CharacterId.Pappu));
        }
    }
}
