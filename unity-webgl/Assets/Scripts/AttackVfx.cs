using System.Collections;
using UnityEngine;

namespace MarketSwarm
{
    public sealed class AttackVfx : MonoBehaviour
    {
        [SerializeField] private SpriteRenderer ringRenderer;
        [SerializeField] private float duration = 0.18f;

        private Coroutine running;

        public void Play(Vector3 position, float radius, Color color)
        {
            transform.position = position;
            transform.localScale = Vector3.one * (radius * 2f);
            ringRenderer.color = new Color(color.r, color.g, color.b, 0.35f);

            if (running != null)
            {
                StopCoroutine(running);
            }

            running = StartCoroutine(Animate());
        }

        private IEnumerator Animate()
        {
            ringRenderer.gameObject.SetActive(true);
            float elapsed = 0f;

            while (elapsed < duration)
            {
                elapsed += Time.deltaTime;
                float t = Mathf.Clamp01(elapsed / duration);
                Color c = ringRenderer.color;
                c.a = Mathf.Lerp(0.35f, 0f, t);
                ringRenderer.color = c;
                yield return null;
            }

            ringRenderer.gameObject.SetActive(false);
            running = null;
        }
    }
}
