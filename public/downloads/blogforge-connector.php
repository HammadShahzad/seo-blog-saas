<?php
/**
 * Plugin Name: BlogForge Connector
 * Plugin URI: https://seo-blog-saas.vercel.app
 * Description: Connects your WordPress site to BlogForge for automatic AI-powered content publishing.
 * Version: 1.0.0
 * Author: BlogForge
 * License: GPL v2 or later
 * Text Domain: blogforge-connector
 */

if (!defined('ABSPATH')) exit;

define('BLOGFORGE_VERSION', '1.0.0');
define('BLOGFORGE_OPTION_KEY', 'blogforge_api_key');

// ─────────────────────────────────────────────
// Admin Menu
// ─────────────────────────────────────────────
add_action('admin_menu', function () {
    add_options_page(
        'BlogForge Connector',
        'BlogForge',
        'manage_options',
        'blogforge-connector',
        'blogforge_settings_page'
    );
});

function blogforge_settings_page() {
    if (!current_user_can('manage_options')) return;

    if (isset($_POST['blogforge_save']) && check_admin_referer('blogforge_settings')) {
        $api_key = sanitize_text_field($_POST['blogforge_api_key'] ?? '');
        if (empty($api_key)) {
            $api_key = wp_generate_password(32, false);
        }
        update_option(BLOGFORGE_OPTION_KEY, $api_key);
        echo '<div class="notice notice-success"><p>Settings saved!</p></div>';
    }

    $api_key = get_option(BLOGFORGE_OPTION_KEY, '');
    $endpoint = home_url('/wp-json/blogforge/v1/');
    ?>
    <div class="wrap">
        <h1>BlogForge Connector</h1>
        <p>Connect your WordPress site to <a href="https://seo-blog-saas.vercel.app" target="_blank">BlogForge</a> to receive AI-generated blog posts automatically.</p>

        <table class="form-table">
            <tr>
                <th>REST API Endpoint</th>
                <td>
                    <code style="background:#f0f0f0;padding:8px 12px;border-radius:4px;display:inline-block;">
                        <?php echo esc_html($endpoint); ?>
                    </code>
                    <p class="description">Add this in BlogForge → Website Settings → WordPress → Plugin Mode</p>
                </td>
            </tr>
        </table>

        <form method="post">
            <?php wp_nonce_field('blogforge_settings'); ?>
            <table class="form-table">
                <tr>
                    <th><label for="blogforge_api_key">API Key (Secret)</label></th>
                    <td>
                        <input type="text" id="blogforge_api_key" name="blogforge_api_key"
                               value="<?php echo esc_attr($api_key); ?>"
                               class="regular-text"
                               placeholder="Leave blank to auto-generate" />
                        <p class="description">Copy this key into BlogForge → Website Settings → WordPress → Plugin API Key</p>
                    </td>
                </tr>
            </table>
            <p class="submit">
                <input type="submit" name="blogforge_save" class="button-primary" value="Save Settings">
            </p>
        </form>

        <?php if ($api_key): ?>
        <hr>
        <h2>Connection Details for BlogForge</h2>
        <table class="widefat" style="max-width:600px">
            <tbody>
                <tr><td><strong>Mode</strong></td><td>Plugin (Recommended)</td></tr>
                <tr><td><strong>Site URL</strong></td><td><?php echo esc_html(home_url()); ?></td></tr>
                <tr><td><strong>API Endpoint</strong></td><td><?php echo esc_html($endpoint); ?></td></tr>
                <tr><td><strong>API Key</strong></td><td><code><?php echo esc_html($api_key); ?></code></td></tr>
            </tbody>
        </table>
        <?php endif; ?>

        <hr>
        <h2>Alternative: Use Application Passwords (No Plugin)</h2>
        <p>You can also connect without this plugin using WordPress Application Passwords:</p>
        <ol>
            <li>Go to <strong>Users → Profile</strong></li>
            <li>Scroll to <strong>Application Passwords</strong></li>
            <li>Enter "BlogForge" as the name and click <strong>Add New Application Password</strong></li>
            <li>Copy the generated password</li>
            <li>In BlogForge: Settings → WordPress → Username + Application Password</li>
        </ol>
    </div>
    <?php
}

// ─────────────────────────────────────────────
// REST API Endpoint
// ─────────────────────────────────────────────
add_action('rest_api_init', function () {
    register_rest_route('blogforge/v1', '/posts', [
        'methods'             => 'POST',
        'callback'            => 'blogforge_create_post',
        'permission_callback' => 'blogforge_authenticate',
    ]);

    register_rest_route('blogforge/v1', '/status', [
        'methods'             => 'GET',
        'callback'            => fn() => new WP_REST_Response(['status' => 'connected', 'version' => BLOGFORGE_VERSION], 200),
        'permission_callback' => 'blogforge_authenticate',
    ]);
});

function blogforge_authenticate(WP_REST_Request $request): bool {
    $stored_key = get_option(BLOGFORGE_OPTION_KEY, '');
    if (empty($stored_key)) return false;

    $provided = $request->get_header('X-BlogForge-Key')
             ?: $request->get_param('api_key')
             ?: '';

    return hash_equals($stored_key, trim($provided));
}

function blogforge_create_post(WP_REST_Request $request): WP_REST_Response {
    $params = $request->get_json_params();

    $title   = sanitize_text_field($params['title'] ?? '');
    $content = wp_kses_post($params['content'] ?? '');
    $status  = in_array($params['status'] ?? 'draft', ['draft', 'publish', 'pending', 'private'])
               ? $params['status']
               : 'draft';

    if (empty($title) || empty($content)) {
        return new WP_REST_Response(['error' => 'title and content are required'], 400);
    }

    $post_data = [
        'post_title'   => $title,
        'post_content' => $content,
        'post_status'  => $status,
        'post_type'    => 'post',
        'post_excerpt' => sanitize_text_field($params['excerpt'] ?? ''),
        'post_name'    => sanitize_title($params['slug'] ?? $title),
    ];

    // Handle tags
    if (!empty($params['tags']) && is_array($params['tags'])) {
        $post_data['tags_input'] = array_map('sanitize_text_field', $params['tags']);
    }

    // Handle category
    if (!empty($params['category'])) {
        $cat = get_cat_ID(sanitize_text_field($params['category']));
        if ($cat) $post_data['post_category'] = [$cat];
    }

    $post_id = wp_insert_post($post_data, true);

    if (is_wp_error($post_id)) {
        return new WP_REST_Response(['error' => $post_id->get_error_message()], 500);
    }

    // Set Yoast SEO meta (if Yoast is active)
    if (!empty($params['meta_title']))       update_post_meta($post_id, '_yoast_wpseo_title',    sanitize_text_field($params['meta_title']));
    if (!empty($params['meta_description'])) update_post_meta($post_id, '_yoast_wpseo_metadesc', sanitize_text_field($params['meta_description']));
    if (!empty($params['focus_keyword']))    update_post_meta($post_id, '_yoast_wpseo_focuskw',  sanitize_text_field($params['focus_keyword']));

    // Upload featured image from URL
    if (!empty($params['featured_image_url'])) {
        $media_id = blogforge_sideload_image($params['featured_image_url'], $post_id, $title);
        if ($media_id && !is_wp_error($media_id)) {
            set_post_thumbnail($post_id, $media_id);
        }
    }

    return new WP_REST_Response([
        'success'   => true,
        'post_id'   => $post_id,
        'post_url'  => get_permalink($post_id),
        'edit_url'  => admin_url("post.php?post={$post_id}&action=edit"),
    ], 201);
}

function blogforge_sideload_image(string $url, int $post_id, string $title): int|WP_Error {
    require_once ABSPATH . 'wp-admin/includes/media.php';
    require_once ABSPATH . 'wp-admin/includes/file.php';
    require_once ABSPATH . 'wp-admin/includes/image.php';

    return media_sideload_image($url, $post_id, sanitize_text_field($title), 'id');
}
