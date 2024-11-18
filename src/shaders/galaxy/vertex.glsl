uniform float uMask;

attribute float alpha;

varying vec4 vColor;

void main()
{
    vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * modelViewPosition;

    gl_PointSize = 7.0;
    gl_PointSize *= (1.0 / - modelViewPosition.z);

    vColor = vec4(color, alpha);

    vec2 screenPosition = gl_Position.xy / gl_Position.w;
    if(screenPosition.x > uMask)
    {
        vColor.a = 0.0;
    }
    // vColor.rgb = vec3(screenPosition.x);
}