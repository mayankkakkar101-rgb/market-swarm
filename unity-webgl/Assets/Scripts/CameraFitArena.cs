using UnityEngine;

namespace MarketSwarm
{
    [RequireComponent(typeof(Camera))]
    public sealed class CameraFitArena : MonoBehaviour
    {
        [SerializeField] private BoxCollider2D arenaBounds;
        [SerializeField] private float padding = 1.2f;

        private void Start()
        {
            Fit();
        }

        private void Fit()
        {
            Camera cam = GetComponent<Camera>();
            Bounds b = arenaBounds.bounds;
            transform.position = new Vector3(b.center.x, b.center.y, transform.position.z);

            float verticalSize = b.extents.y + padding;
            float horizontalSize = (b.extents.x + padding) / cam.aspect;
            cam.orthographicSize = Mathf.Max(verticalSize, horizontalSize);
        }
    }
}
