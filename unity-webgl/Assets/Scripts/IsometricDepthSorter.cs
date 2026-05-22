using UnityEngine;

namespace MarketSwarm
{
    [RequireComponent(typeof(SpriteRenderer))]
    public sealed class IsometricDepthSorter : MonoBehaviour
    {
        [SerializeField] private int baseOrder = 5000;
        [SerializeField] private int precision = 100;

        private SpriteRenderer spriteRenderer;

        private void Awake()
        {
            spriteRenderer = GetComponent<SpriteRenderer>();
        }

        private void LateUpdate()
        {
            spriteRenderer.sortingOrder = baseOrder - Mathf.RoundToInt(transform.position.y * precision);
        }
    }
}
