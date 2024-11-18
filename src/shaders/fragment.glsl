uniform float uTime;
uniform sampler2D uPerlinTexture; // when retreiving a texture we most likely need the sampler2D

varying vec2 vUv;

void main() {

    // Scale and animate
    vec2 smokeUv = vUv;
    smokeUv.x *= 0.5;
    smokeUv.y *= 0.3;
    smokeUv.y -= uTime * 0.03;

    // Smoke
    float smoke = texture(uPerlinTexture, smokeUv).r;

    // Remap
    smoke = smoothstep(0.4, 1.0, smoke);

    // Edges
    // smoke = 1.0; // value to focus on tweaking the edges
    smoke *= smoothstep(0.0, 0.1, vUv.x);
    smoke *= smoothstep(1.0, 0.9, vUv.x);
    smoke *= smoothstep(0.0, 0.1, vUv.y);
    smoke *= smoothstep(1.0, 0.4, vUv.y);

    // Final color
    gl_FragColor = vec4(0.6, 0.3, 0.2, smoke); // brown
    // gl_FragColor = vec4(1.0, 1.0, 1.0, smoke); // white
    // gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); // value to focus on tweaking the twist and wind animation
    #include <tonemapping_fragment>
    #include <colorspace_fragment>

}