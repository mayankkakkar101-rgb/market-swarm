using UnityEngine;

namespace MarketSwarm
{
    [CreateAssetMenu(menuName = "Market Swarm/Character Definition")]
    public sealed class CharacterDefinition : ScriptableObject
    {
        public CharacterId id;
        public string displayName;
        public string weaponName;
        public Sprite portrait;
        public RuntimeAnimatorController animatorController;
        public Color attackColor = Color.white;

        [Header("Movement")]
        public float moveSpeed = 4.5f;

        [Header("Combat")]
        public float attackRadius = 1.6f;
        public float attackCooldown = 0.35f;
        public float staminaCost = 25f;
        public float maxStamina = 100f;
        public float staminaRegenPerSecond = 45f;
        public float maxHealth = 100f;
    }
}
