using UnityEngine;

namespace MarketSwarm
{
    [RequireComponent(typeof(Rigidbody2D))]
    public sealed class EnemyController : MonoBehaviour
    {
        [SerializeField] private float moveSpeed = 2.2f;
        [SerializeField] private float contactDamagePerSecond = 8f;
        [SerializeField] private SpriteRenderer spriteRenderer;
        [SerializeField] private Animator animator;

        private Rigidbody2D rb;
        private PlayerController target;
        private bool dead;

        private void Awake()
        {
            rb = GetComponent<Rigidbody2D>();
            rb.gravityScale = 0f;
            rb.freezeRotation = true;
        }

        public void Initialize(PlayerController player, bool leader)
        {
            target = player;

            if (leader)
            {
                transform.localScale *= 1.35f;
                moveSpeed *= 0.75f;
                contactDamagePerSecond *= 1.35f;
            }
        }

        private void FixedUpdate()
        {
            if (dead || target == null)
            {
                return;
            }

            Vector2 toPlayer = (target.transform.position - transform.position);
            Vector2 dir = toPlayer.sqrMagnitude > 0.001f ? toPlayer.normalized : Vector2.zero;
            rb.MovePosition(rb.position + dir * moveSpeed * Time.fixedDeltaTime);

            if (animator != null)
            {
                animator.SetFloat("MoveX", dir.x);
                animator.SetFloat("MoveY", dir.y);
                animator.SetFloat("Speed", dir.sqrMagnitude);
            }
        }

        private void OnCollisionStay2D(Collision2D collision)
        {
            if (dead || !collision.collider.TryGetComponent(out PlayerController player))
            {
                return;
            }

            player.TakeDamage(contactDamagePerSecond * Time.deltaTime);
        }

        public void Die()
        {
            if (dead)
            {
                return;
            }

            dead = true;
            GameManager.Instance.AddKill();
            Destroy(gameObject);
        }
    }
}
